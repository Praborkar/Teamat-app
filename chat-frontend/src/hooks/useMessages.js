import { useInfiniteQuery, useQueryClient } from "react-query";
import api from "../api/api";

export function useMessages(channelId) {
  const queryClient = useQueryClient();

  // 🚀 Infinite Query for pagination
  const messageQuery = useInfiniteQuery(
    ["messages", channelId],
    async ({ pageParam = 1 }) => {
      const res = await api.get(`/messages/${channelId}?page=${pageParam}`);
      return res.data;
    },
    {
      enabled: !!channelId,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
    }
  );

  // ⭐ Add optimistic message instantly
  function addLocalMessage(message) {
    queryClient.setQueryData(["messages", channelId], (old) => {
      if (!old) {
        return {
          pages: [
            {
              messages: [message],
              page: 1,
              totalPages: 1,
            },
          ],
        };
      }

      const pages = old.pages.map((page, index) => {
        if (index === old.pages.length - 1) {
          // Only add to last page
          const exists = page.messages.some((m) => m._id === message._id);

          if (exists) return page;

          return {
            ...page,
            messages: [...page.messages, message],
          };
        }
        return page;
      });

      return { ...old, pages };
    });
  }

  // ⭐ Replace optimistic temp message with real DB message
  function updateConfirmedMessage(finalMsg) {
    queryClient.setQueryData(["messages", channelId], (old) => {
      if (!old) return old;

      const updatedPages = old.pages.map((page) => {
        const updatedMessages = page.messages.map((msg) => {
          // Replace only the optimistic message with matching clientSideId or text
          const isMatch = msg.optimistic && (
            msg._id === finalMsg.clientSideId || 
            (msg.text === finalMsg.text && (msg.user?._id === "me" || msg.user?._id === finalMsg.user?._id))
          );

          if (isMatch) return finalMsg;
          return msg;
        });

        return { ...page, messages: updatedMessages };
      });

      return { ...old, pages: updatedPages };
    });
  }

  // "Refetch" button support
  const refetchMessages = () => {
    queryClient.invalidateQueries(["messages", channelId]);
  };

  return {
    ...messageQuery,
    addLocalMessage,
    updateConfirmedMessage,
    refetchMessages,
  };
}
