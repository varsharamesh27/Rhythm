import type { HabitCategory } from "@/types/database";

export type RoutineBlock = {
  title: string;
  plannedStart: string;
  plannedEnd: string;
  category: HabitCategory;
};

export const PERSONAL_ROUTINE: ReadonlyArray<RoutineBlock> = [
  { title: "Wake up, make bed, open curtains, sunlight and fresh air", plannedStart: "05:45", plannedEnd: "05:50", category: "routine" },
  { title: "Washroom, brush and shower", plannedStart: "05:50", plannedEnd: "06:10", category: "routine" },
  { title: "Change clothes and moisturize", plannedStart: "06:10", plannedEnd: "06:20", category: "routine" },
  { title: "Skincare and haircare", plannedStart: "06:20", plannedEnd: "06:30", category: "routine" },
  { title: "Prayer", plannedStart: "06:30", plannedEnd: "06:40", category: "recovery" },
  { title: "Meditation or yoga", plannedStart: "06:40", plannedEnd: "06:50", category: "recovery" },
  { title: "Breakfast prep", plannedStart: "06:50", plannedEnd: "07:10", category: "nutrition" },
  { title: "News", plannedStart: "07:10", plannedEnd: "07:15", category: "routine" },
  { title: "Work focus", plannedStart: "07:15", plannedEnd: "11:00", category: "career" },
  { title: "ABC juice or coconut water", plannedStart: "11:00", plannedEnd: "11:10", category: "nutrition" },
  { title: "Lunch and short walk", plannedStart: "12:30", plannedEnd: "13:45", category: "nutrition" },
  { title: "Green tea", plannedStart: "16:00", plannedEnd: "16:10", category: "nutrition" },
  { title: "Gym, commute home and stretch", plannedStart: "17:00", plannedEnd: "19:00", category: "movement" },
  { title: "Shower and relax", plannedStart: "19:00", plannedEnd: "19:15", category: "recovery" },
  { title: "Dinner prep", plannedStart: "19:15", plannedEnd: "19:45", category: "nutrition" },
  { title: "Dinner", plannedStart: "19:45", plannedEnd: "20:00", category: "nutrition" },
  { title: "Buffer", plannedStart: "20:00", plannedEnd: "20:15", category: "recovery" },
  { title: "Career study", plannedStart: "20:15", plannedEnd: "20:45", category: "career" },
  { title: "Hobby", plannedStart: "20:50", plannedEnd: "21:15", category: "recovery" },
  { title: "Prepare tomorrow: soak nuts, clothes, braid hair, pack and screens off", plannedStart: "21:15", plannedEnd: "21:25", category: "routine" },
  { title: "Journal", plannedStart: "21:25", plannedEnd: "21:40", category: "recovery" },
  { title: "Bed routine", plannedStart: "21:40", plannedEnd: "21:45", category: "recovery" },
  { title: "Lights out", plannedStart: "21:45", plannedEnd: "22:00", category: "recovery" }
];
