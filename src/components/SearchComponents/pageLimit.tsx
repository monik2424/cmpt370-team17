// csy791 - Nicholas Kennedy
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";



interface pageDetails {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}


export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: pageDetails) {


  if (totalPages <= 1) return null; // No need to add pages if less than 20 events

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };



  return (
    <div className="mt-12 flex items-center justify-center gap-2">

      {/* Previous Button */}
      <button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-800 border border-gray-700 text-white font-mono text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex gap-2">
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 font-mono text-sm rounded-lg transition ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
            }`}
            aria-label={`Go to page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-800 border border-gray-700 text-white font-mono text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}