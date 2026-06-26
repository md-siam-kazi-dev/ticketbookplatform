export const getUserTransactions = async (email, token) => {
  if (!email || !token) return [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/trx/${email}`, {
      headers: {
        // Fixed the typo from 'bdfh' to 'Bearer'
        'Authorization': `Bearer ${token}` 
      }
    });
    
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};