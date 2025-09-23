export const censorEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;

  const visiblePart = user.slice(0, Math.min(3, user.length)); // first 3 chars
  return `${visiblePart}${"*".repeat(Math.max(user.length - 3, 3))}@${domain}`;
};
