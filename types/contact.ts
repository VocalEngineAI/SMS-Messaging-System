export type ConsentStatus = "Opted In" | "Opted Out";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  coinBalance: number;
  consent: ConsentStatus;
};
