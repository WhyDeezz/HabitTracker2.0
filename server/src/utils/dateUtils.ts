export const getISTDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  
  // Format: MM/DD/YYYY in US locale with IST timezone
  // We need YYYY-MM-DD for consistency
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  
  return `${year}-${month}-${day}`;
};

export const getISTDateTime = (): Date => {
    // Returns a Date object that represents the current time in IST (shifted)
    // Careful: The internal UTC timestamp will be shifted. Use only for display or local logic.
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // IST is UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(utc + istOffset);
};

export const getYesterdayISTDate = (todayIST: string): string => {
    const date = new Date(todayIST); 
    // This creates a UTC date from the string "YYYY-MM-DD" which effectively sets time to 00:00 UTC
    // Since we are just manipulating the date string logic, this is fine for finding the "previous date string"
    // But safely:
    date.setDate(date.getDate() - 1);
    
    // Convert back to YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
