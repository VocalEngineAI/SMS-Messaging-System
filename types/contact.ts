export type ConsentStatus = "Opted In" | "Opted Out" | "Pending";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  business: string;
  consent: ConsentStatus;
};
