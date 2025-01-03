"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/app/firebase';

interface NavigationStructure {
  travel: {
    [region: string]: {
      regions: string[];
      href: string;
    };
  };
  stills: {
    categories: { name: string; href: string; }[];
  };
}

const NavigationContext = createContext<NavigationStructure | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationStructure | null>(null);

  useEffect(() => {
    const buildNavigation = async () => {
      const q = query(collection(db, "galleries"));
      const snapshot = await getDocs(q);
      
      const navStructure: NavigationStructure = {
        travel: {},
        stills: { categories: [] }
      };

      snapshot.docs.forEach(doc => {
        const gallery = doc.data();
        // Handle existing documents that don't have navigation property yet
        const navigation = gallery.navigation || {
          category: gallery.category,
          primaryCategory: gallery.primaryCategory,
          secondaryCategory: gallery.secondaryCategory
        };

        if (!navigation) return; // Skip if no navigation data

        const { category, primaryCategory, secondaryCategory } = navigation;

        if (category === 'travel' && primaryCategory) {
          if (!navStructure.travel[primaryCategory]) {
            navStructure.travel[primaryCategory] = {
              regions: [],
              href: `/travel/${primaryCategory.toLowerCase()}`
            };
          }
          if (secondaryCategory && !navStructure.travel[primaryCategory].regions.includes(secondaryCategory)) {
            navStructure.travel[primaryCategory].regions.push(secondaryCategory);
          }
        } else if (category === 'stills' && primaryCategory) {
          const categoryExists = navStructure.stills.categories.some(
            cat => cat.name === primaryCategory
          );
          if (!categoryExists) {
            navStructure.stills.categories.push({
              name: primaryCategory,
              href: `/stills/${primaryCategory.toLowerCase()}`
            });
          }
        }
      });

      setNavigation(navStructure);
    };

    buildNavigation();
  }, []);

  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);