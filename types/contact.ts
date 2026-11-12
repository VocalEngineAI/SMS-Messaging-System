export type ConsentStatus = "Opted In" | "Opted Out";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  coinBalance: number;
  consent: ConsentStatus;
};
