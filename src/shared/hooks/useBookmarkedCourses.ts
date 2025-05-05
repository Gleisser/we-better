import { useState, useEffect } from 'react';
import { Course } from '@/shared/components/widgets/CourseWidget/types';

interface BookmarkedCourse extends Course {
  bookmarkedAt: number;
}

interface UseBookmarkedCoursesResult {
  bookmarkedCourses: BookmarkedCourse[];
  addBookmark: (course: Course) => void;
  removeBookmark: (courseId: string) => void;
  isBookmarked: (courseId: string) => boolean;
}

export const useBookmarkedCourses = (): UseBookmarkedCoursesResult => {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<BookmarkedCourse[]>(() => {
    const saved = localStorage.getItem('bookmarkedCourses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedCourses', JSON.stringify(bookmarkedCourses));
  }, [bookmarkedCourses]);

  const addBookmark = (course: Course): void => {
    setBookmarkedCourses(prev => {
      if (prev.some(c => c.id === course.id)) return prev;
      return [...prev, { ...course, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (courseId: string): void => {
    setBookmarkedCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const isBookmarked = (courseId: string): boolean => {
    return bookmarkedCourses.some(course => course.id === courseId);
  };

  return {
    bookmarkedCourses,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
