import { ref, computed } from 'vue';

export function useNotification() {
  const message = ref("");
  const messageType = ref<"success" | "error" | "">("");

  const messageClass = computed(() => {
    if (messageType.value === "success") return "message-success";
    if (messageType.value === "error") return "message-error";
    return "message-info";
  });

  function showMessage(type: "success" | "error", text: string) {
    messageType.value = type;
    message.value = text;
    setTimeout(() => {
      message.value = "";
      messageType.value = "";
    }, 4000);
  }

  return {
    message,
    messageType,
    messageClass,
    showMessage
  };
}