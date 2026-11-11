import type { Contact } from "@/types/contact";
import type { SmsMessage } from "@/types/sms";

/*
 * Realistic placeholder data for the frontend-only prototype. None of this
 * is fetched from a backend — see README.md "Connecting a real backend"
 * for where each screen would switch to live data.
 */

export const DUMMY_CONTACTS: Contact[] = [
  { id: "c1", name: "Olivia Bennett", phone: "+1 (415) 555-0132", business: "The Coffee Hub", consent: "Opted In" },
  { id: "c2", name: "Marcus Lee", phone: "+1 (415) 555-0198", business: "Lee's Auto Repair", consent: "Opted In" },
  { id: "c3", name: "Sofia Martinez", phone: "+1 (628) 555-0144", business: "Bloom Florals", consent: "Opted In" },
  { id: "c4", name: "Ethan Walker", phone: "+1 (628) 555-0176", business: "Walker Fitness Studio", consent: "Pending" },
  { id: "c5", name: "Ava Thompson", phone: "+1 (650) 555-0112", business: "The Coffee Hub", consent: "Opted In" },
  { id: "c6", name: "Noah Rodriguez", phone: "+1 (650) 555-0187", business: "Rodriguez Dental", consent: "Opted Out" },
  { id: "c7", name: "Isabella Chen", phone: "+1 (510) 555-0121", business: "Chen & Co. Salon", consent: "Opted In" },
  { id: "c8", name: "Liam Patel", phone: "+1 (510) 555-0163", business: "Patel Grocers", consent: "Opted In" },
  { id: "c9", name: "Mia Johnson", phone: "+1 (925) 555-0155", business: "Bloom Florals", consent: "Pending" },
  { id: "c10", name: "James Carter", phone: "+1 (925) 555-0109", business: "Carter Hardware", consent: "Opted In" },
  { id: "c11", name: "Charlotte Kim", phone: "+1 (408) 555-0142", business: "Kim's Bakery", consent: "Opted In" },
  { id: "c12", name: "Benjamin Scott", phone: "+1 (408) 555-0128", business: "Scott Landscaping", consent: "Opted Out" },
  { id: "c13", name: "Amelia Reyes", phone: "+1 (707) 555-0166", business: "Reyes Pet Grooming", consent: "Opted In" },
  { id: "c14", name: "Lucas Nguyen", phone: "+1 (707) 555-0193", business: "Nguyen Tax Services", consent: "Opted In" },
  { id: "c15", name: "Harper Davis", phone: "+1 (831) 555-0118", business: "Walker Fitness Studio", consent: "Opted In" },
];

export const DUMMY_SMS_HISTORY: SmsMessage[] = [
  {
    id: "m1",
    recipient: "Olivia Bennett",
    phone: "+1 (415) 555-0132",
    message: "☕ Happy Hour! 20% off all drinks today 2-5pm at The Coffee Hub. Reply STOP to opt out.",
    date: "2026-11-10 14:02",
    status: "Delivered",
  },
  {
    id: "m2",
    recipient: "Marcus Lee",
    phone: "+1 (415) 555-0198",
    message: "Your vehicle inspection is due. Book now and get $15 off at Lee's Auto Repair.",
    date: "2026-11-10 14:02",
    status: "Delivered",
  },
  {
    id: "m3",
    recipient: "Noah Rodriguez",
    phone: "+1 (650) 555-0187",
    message: "Reminder: Rodriguez Dental holiday hours start Monday. Reply STOP to opt out.",
    date: "2026-11-09 09:15",
    status: "Failed",
  },
  {
    id: "m4",
    recipient: "Isabella Chen",
    phone: "+1 (510) 555-0121",
    message: "New year, new look! Book your appointment at Chen & Co. Salon this week for 15% off.",
    date: "2026-11-09 09:15",
    status: "Sent",
  },
  {
    id: "m5",
    recipient: "Sofia Martinez",
    phone: "+1 (628) 555-0144",
    message: "🌸 Fresh winter arrangements just dropped at Bloom Florals. Order online today!",
    date: "2026-11-08 11:40",
    status: "Delivered",
  },
  {
    id: "m6",
    recipient: "James Carter",
    phone: "+1 (925) 555-0109",
    message: "Carter Hardware Black Friday preview: 25% off all power tools this weekend only.",
    date: "2026-11-07 16:20",
    status: "Delivered",
  },
  {
    id: "m7",
    recipient: "Charlotte Kim",
    phone: "+1 (408) 555-0142",
    message: "Fresh croissants out of the oven now at Kim's Bakery. Come say hi!",
    date: "2026-11-07 08:05",
    status: "Sent",
  },
  {
    id: "m8",
    recipient: "Amelia Reyes",
    phone: "+1 (707) 555-0166",
    message: "Your pup is due for a groom! Book this week at Reyes Pet Grooming and save 10%.",
    date: "2026-11-06 13:30",
    status: "Delivered",
  },
  {
    id: "m9",
    recipient: "Lucas Nguyen",
    phone: "+1 (707) 555-0193",
    message: "Tax season prep starts now — schedule your free consult with Nguyen Tax Services.",
    date: "2026-11-05 10:10",
    status: "Failed",
  },
  {
    id: "m10",
    recipient: "Harper Davis",
    phone: "+1 (831) 555-0118",
    message: "New year, new gains 💪 Walker Fitness Studio January memberships are now open.",
    date: "2026-11-04 17:50",
    status: "Delivered",
  },
];

export const DASHBOARD_STATS = {
  totalContacts: DUMMY_CONTACTS.length,
  totalSmsSent: DUMMY_SMS_HISTORY.length,
  delivered: DUMMY_SMS_HISTORY.filter((m) => m.status === "Delivered").length,
  failed: DUMMY_SMS_HISTORY.filter((m) => m.status === "Failed").length,
};

export const RECENT_ACTIVITY = DUMMY_SMS_HISTORY.slice(0, 5);
