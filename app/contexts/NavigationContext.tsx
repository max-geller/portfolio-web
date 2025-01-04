"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/app/firebase';

interface Category {
  id: string;
  name: string;
  parentCategory: "stills" | "travel" | "aerial";
  type: "primary" | "secondary";
  parentId?: string;
  order: number;
}

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
  aerial: {
    categories: { name: string; href: string; }[];
  };
}

const NavigationContext = createContext<NavigationStructure | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationStructure | null>(null);

  useEffect(() => {
    const buildNavigation = async () => {
      // First, fetch all categories
      const categoriesQuery = query(collection(db, "categories"));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

      // Then fetch galleries for secondary category validation
      const galleriesQuery = query(collection(db, "galleries"));
      const galleriesSnapshot = await getDocs(galleriesQuery);
      
      const navStructure: NavigationStructure = {
        travel: {},
        stills: { categories: [] },
        aerial: { categories: [] }
      };

      // Process primary categories first
      categories
        .filter(cat => cat.type === "primary")
        .sort((a, b) => a.order - b.order)
        .forEach(primaryCat => {
          if (primaryCat.parentCategory === 'travel') {
            navStructure.travel[primaryCat.name] = {
              regions: [],
              href: `/travel/${primaryCat.name.toLowerCase()}`
            };
          } else if (primaryCat.parentCategory === 'stills') {
            navStructure.stills.categories.push({
              name: primaryCat.name,
              href: `/stills/${primaryCat.name.toLowerCase()}`
            });
          } else if (primaryCat.parentCategory === 'aerial') {
            navStructure.aerial.categories.push({
              name: primaryCat.name,
              href: `/aerial/${primaryCat.name.toLowerCase()}`
            });
          }
        });

      // Then process secondary categories
      categories
        .filter(cat => cat.type === "secondary")
        .sort((a, b) => a.order - b.order)
        .forEach(secondaryCat => {
          if (secondaryCat.parentCategory === 'travel') {
            const primaryCat = categories.find(pc => pc.id === secondaryCat.parentId);
            if (primaryCat && navStructure.travel[primaryCat.name]) {
              navStructure.travel[primaryCat.name].regions.push(secondaryCat.name);
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