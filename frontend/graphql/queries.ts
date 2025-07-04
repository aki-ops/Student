import { gql } from '@apollo/client';

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    current_User {
      id
      username
      role
    }
  }
`;

// Updated: Backend now has findAllUsers query
export const GET_USERS_QUERY = gql`
  query GetUsers {
    findAllUsers {
      id
      username
      fullName
      role
    }
  }
`;

// Updated: Backend now has getAllClasses query
export const GET_CLASSES_QUERY = gql`
  query GetClasses {
    getAllClasses {
      id
      className
      subject
      teacherId
      teacher {
        id
        username
        fullName
        role
      }
      studentIds
      students {
        id
        username
        fullName
        role
      }
    }
  }
`;

// Query riêng cho học sinh lấy lớp học của mình
export const GET_MY_CLASSES_QUERY = gql`
  query GetMyClasses {
    getMyClasses {
      id
      className
      subject
      teacherId
      studentIds
    }
  }
`;

// Updated: Backend now has getAllScores query  
export const GET_SCORES_QUERY = gql`
  query GetScores {
    getAllScores {
      id
      studentId
      classId
      subject
      score
    }
  }
`;

// ATTENDANCE - This one is correct
export const GET_ATTENDANCE_QUERY = gql`
  query GetAttendance {
    attendance {
      id
      classId
      date
      records { 
        studentId 
        status 
      }
    }
  }
`;

// Individual queries for when we have IDs
export const GET_CLASS_BY_ID_QUERY = gql`
  query GetClassById($id: String!) {
    class(id: $id) {
      id
      className
      subject
      teacherId
      studentIds
    }
  }
`;

export const GET_SCORE_BY_ID_QUERY = gql`
  query GetScoreById($id: String!) {
    score(id: $id) {
      id
      studentId
      classId
      subject
      score
    }
  }
`;

// TEMPORARY: Mock data queries for development
// These will be replaced when backend implements the real queries
export const GET_MOCK_CLASSES_QUERY = gql`
  query GetMockClasses {
    # This is a placeholder - will be replaced with real query
    __typename
  }
`;

export const GET_MOCK_SCORES_QUERY = gql`
  query GetMockScores {
    # This is a placeholder - will be replaced with real query
    __typename
  }
`;

export const FIND_USER_BY_ID_QUERY = gql`
  query FindById($id: String!) {
    findById(id: $id) {
      id
      username
      fullName
      role
    }
  }
`;

export const GET_MY_NOTIFICATION = gql`
  query GetMyNotifications {
    getMyNotifications {
      id
      message
      sender
      recipients
      createdAt
      className
      teacherName
    }
  }
`;

export const GET_SENT_NOTIFICATIONS = gql`
  query GetSentNotifications {
    getSentNotifications {
      id
      message
      recipients
      createdAt
      className
      teacherName
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    getUnreadNotificationCount
  }
`;