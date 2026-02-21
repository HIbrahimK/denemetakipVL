"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/auth';

interface SchoolData {
  name: string;
  appShortName: string;
  logoUrl: string;
}

interface SchoolContextType {
  schoolName: string;
  schoolAppName: string;
  schoolLogo: string;
  isLoading: boolean;
  refreshSchoolData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: "DenemeTakip.net",
    appShortName: "Deneme Takip Sistemi",
    logoUrl: "/LOGO.png"
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchoolData = async () => {
    try {
      // First check if user is logged in and has school data
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (userStr) {
        const user = JSON.parse(userStr);
        
        // If school data is in user object, use it
        if (user.school) {
          setSchoolData({
            name: user.school.name || "DenemeTakip.net",
            appShortName: user.school.appShortName || "Deneme Takip Sistemi",
            logoUrl: user.school.logoUrl || "/LOGO.png"
          });
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        if (user.schoolId) {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/schools/${user.schoolId}`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            const newSchoolData = {
              name: data.name || "DenemeTakip.net",
              appShortName: data.appShortName || "Deneme Takip Sistemi",
              logoUrl: data.logoUrl || "/LOGO.png"
            };
            
            setSchoolData(newSchoolData);
            
            // Update localStorage with school data
            user.school = newSchoolData;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } else {
        // No user logged in, check if there's a default school
        try {
          const response = await fetch(`${API_BASE_URL}/schools`, {
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.name || data.logoUrl) {
              setSchoolData({
                name: data.name || "DenemeTakip.net",
                appShortName: data.appShortName || "Deneme Takip Sistemi",
                logoUrl: data.logoUrl || "/LOGO.png"
              });
            }
          }
        } catch (error) {
          // Silent fail - use defaults
          console.log('No default school found, using defaults');
        }
      }
    } catch (error) {
      console.error('Failed to fetch school data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();

    // Listen for storage changes
    const handleStorageChange = () => {
      fetchSchoolData();
    };

    const handleSchoolUpdate = () => {
      fetchSchoolData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('schoolDataUpdated', handleSchoolUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('schoolDataUpdated', handleSchoolUpdate);
      }
    };
  }, []);

  return (
    <SchoolContext.Provider 
      value={{ 
        schoolName: schoolData.name, 
        schoolAppName: schoolData.appShortName || schoolData.name,
        schoolLogo: schoolData.logoUrl,
        isLoading,
        refreshSchoolData: fetchSchoolData
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
