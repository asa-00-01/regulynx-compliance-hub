
import { useState, useMemo } from 'react';

interface PaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
}

interface PaginationResult<T> {
  currentData: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Provides pagination functionality for any array of data.
 * Handles page navigation, boundary checks, and automatic reset when data changes.
 */
export const usePagination = <T,>({ 
  data: dataList, 
  itemsPerPage: itemsPerPageLimit = 10 
}: PaginationProps<T>): PaginationResult<T> => {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const totalPagesCount = Math.ceil(dataList.length / itemsPerPageLimit);
  const startingIndex = (currentPageNumber - 1) * itemsPerPageLimit;
  const endingIndex = startingIndex + itemsPerPageLimit;

  const currentPageData = useMemo(() => {
    return dataList.slice(startingIndex, endingIndex);
  }, [dataList, startingIndex, endingIndex]);

  /**
   * Navigates to a specific page with boundary validation
   */
  const navigateToPage = (targetPageNumber: number) => {
    const validPageNumber = Math.max(1, Math.min(targetPageNumber, totalPagesCount || 1));
    setCurrentPageNumber(validPageNumber);
  };

  /**
   * Navigates to the next page if available
   */
  const navigateToNextPage = () => {
    navigateToPage(currentPageNumber + 1);
  };

  /**
   * Navigates to the previous page if available
   */
  const navigateToPreviousPage = () => {
    navigateToPage(currentPageNumber - 1);
  };

  /**
   * Navigates to the first page
   */
  const navigateToFirstPage = () => {
    navigateToPage(1);
  };

  /**
   * Navigates to the last page
   */
  const navigateToLastPage = () => {
    navigateToPage(totalPagesCount);
  };

  // Reset to first page when data changes
  useMemo(() => {
    setCurrentPageNumber(1);
  }, [dataList.length]);

  return {
    currentData: currentPageData,
    currentPage: currentPageNumber,
    totalPages: totalPagesCount,
    totalItems: dataList.length,
    itemsPerPage: itemsPerPageLimit,
    startIndex: dataList.length > 0 ? startingIndex + 1 : 0,
    endIndex: Math.min(endingIndex, dataList.length),
    goToPage: navigateToPage,
    goToNextPage: navigateToNextPage,
    goToPrevPage: navigateToPreviousPage,
    goToFirstPage: navigateToFirstPage,
    goToLastPage: navigateToLastPage,
    hasNextPage: currentPageNumber < totalPagesCount,
    hasPrevPage: currentPageNumber > 1,
  };
};
