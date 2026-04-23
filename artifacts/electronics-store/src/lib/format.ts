export function formatPrice(price: string | number | undefined | null): string {
  if (!price) return "KSh 0";
  return "KSh " + Number(price).toLocaleString("en-KE", { maximumFractionDigits: 0 });
}

export function buildWhatsAppUrl(number: string | undefined, message: string): string {
  if (!number) return "#";
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
