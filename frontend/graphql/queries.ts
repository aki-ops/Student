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
export const GET_USERS_QUERY = gql`
  query GetUsers {
    findAllUser {
      id
      username
      fullName
      role
    }
  }
`;

// CLASSES
export const GET_CLASSES_QUERY = gql`
  query GetClasses {
    class {
      id
      className
      subject
      teacherId
      studentIds
    }
  }
`;

// SCORES
export const GET_SCORES_QUERY = gql`
  query GetScores {
    score {
      id
      studentId
      classId
      subject
      score
    }
  }
`;

// ATTENDANCE
export const GET_ATTENDANCE_QUERY = gql`
  query GetAttendance {
    attendance {
      id
      classId
      date
      records { studentId status }
    }
  }
`;
