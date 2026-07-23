import api from "@/lib/axiosInstance";

export const getActivityLogsApi = async ( page: number = 1, limit: number = 10, tab: string = "ALL", wallet?: string ) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    tab,
  });

  if (tab === "MY_ACTIVITY" && wallet) {
    queryParams.append("wallet", wallet);
  }

  const response = await api.get(`/activity/logs?${queryParams.toString()}`);
  return response.data;
};

export const getActivityStatsApi = async () => {
  const response = await api.get("/activity/stats");
  return response.data;
};