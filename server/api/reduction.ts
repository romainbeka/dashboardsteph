import type { Reduction, ReductionStatus  } from '~/types'

const getReductionStatus = (start: string, end: string): ReductionStatus => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffDays = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (now >= startDate && now <= endDate) {
    return diffDays <= 7 ? "Bientôt Expirées" : "Active";
  } else if (now > endDate) {
    return "Terminer";
  } else {
    return "Prochainement";
  }
};
const Reduction: Reduction[] = [
  {
    id: 1,
    code: 'Inox10',
    pourcentage: 10,
    utiliser: 36,
    maxUsage: 500,
    start: "2024-12-05",
    end: "2025-12-12",
    status: getReductionStatus("2024-12-05", "2025-12-12"),
    isActive: true,
  },
  {
    id: 2,
    code: '3g4jg8',
    pourcentage: 60,
    utiliser: 2,
    maxUsage: 5,
    start: "2025-03-19",
    end: "2025-03-20",
    status: getReductionStatus("2025-03-19", "2025-03-20"),
    isActive: true,
  },
  {
    id: 3,
    code: 'Influenceur',
    pourcentage: 100,
    utiliser: 3,
    maxUsage: 5,
    start: "2025-03-10",
    end: "2025-03-20",
    status: getReductionStatus("2025-03-19", "2025-03-20"),
    isActive: true,
  },
  {
    id: 4,
    code: 'Influenceur',
    pourcentage: 100,
    utiliser: 4,
    maxUsage: 5,
    start: "2025-03-19",
    end: "2025-03-20",
    status: getReductionStatus("2025-03-19", "2025-03-20"),
    isActive: true,
  },
  {
    id: 5,
    code: 'Influenceur',
    pourcentage: 100,
    utiliser: 5,
    maxUsage: 5,
    start: "2024-12-05",
    end: "2025-03-25",
    status: getReductionStatus("2024-12-05", "2025-03-10"),
    isActive: true,
  },
  {
    id: 6,
    code: 'Influenceur',
    pourcentage: 100,
    utiliser: 100,
    maxUsage: null,
    start: "2024-12-05",
    end: "2025-03-20",
    status: getReductionStatus("2024-12-05", "2025-03-20"),
    isActive: true,
  },
];

export default eventHandler(async () => {
  return Reduction.map((reduction) => ({
    ...reduction,
    status: getReductionStatus(reduction.start, reduction.end), // 🔥 Mise à jour dynamique
  }));
});

