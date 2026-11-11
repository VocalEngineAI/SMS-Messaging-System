export type SmsStatus = "Sent" | "Delivered" | "Failed";

export type SmsMessage = {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  date: string;
  status: SmsStatus;
};

export type ActivityItem = {
  id: string;
  recipient: string;
  message: string;
  date: string;
  status: SmsStatus;
};
