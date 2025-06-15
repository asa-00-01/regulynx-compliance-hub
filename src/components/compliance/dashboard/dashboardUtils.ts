
export const getRiskScoreClass = (score: number) => {
  if (score <= 30) return "bg-green-100 text-green-800";
  if (score <= 70) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export const getKYCStatusClass = (status: string) => {
  switch (status) {
    case 'verified':
      return "bg-green-100 text-green-800";
    case 'pending':
      return "bg-yellow-100 text-yellow-800";
    case 'information_requested':
      return "bg-orange-100 text-orange-800";
    case 'rejected':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
