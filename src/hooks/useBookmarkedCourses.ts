import { useState, useEffect } from 'react';
import { Course } from '@/components/widgets/CourseWidget/types';

interface BookmarkedCourse extends Course {
  bookmarkedAt: number;
}

export const useBookmarkedCourses = () => {
  const [bookmarkedCourses, setBookmarkedCourses] = useState<BookmarkedCourse[]>(() => {
    const saved = localStorage.getItem('bookmarkedCourses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookmarkedCourses', JSON.stringify(bookmarkedCourses));
  }, [bookmarkedCourses]);

  const addBookmark = (course: Course) => {
    setBookmarkedCourses(prev => {
      if (prev.some(c => c.id === course.id)) return prev;
      return [...prev, { ...course, bookmarkedAt: Date.now() }];
    });
  };

  const removeBookmark = (courseId: string) => {
    setBookmarkedCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const isBookmarked = (courseId: string) => {
    return bookmarkedCourses.some(course => course.id === courseId);
  };

  return {
    bookmarkedCourses,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
}; 