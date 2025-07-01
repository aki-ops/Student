import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    SignIn(input: $input) {
      access_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    CreateUser(input: $input) {
      id
      username
      fullName
      role
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    CreateUser(input: $input) {
      id
      username
      fullName
      role
    }
  }
`;

// Updated: Backend now has updateUser and removeUser mutations
export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      fullName
      role
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: Int!) {
    removeUser(id: $id) {
      id
    }
  }
`;

// CLASSES - Fixed to match backend schema
export const CREATE_CLASS_MUTATION = gql`
  mutation CreateClass($createClassInput: CreateClassInput!) {
    createClass(createClassInput: $createClassInput) {
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

export const CREATE_NOTIFICATION_MUTATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      message
      recipients
    }
  }
`;

export const ADD_STUDENT_TO_CLASS_MUTATION = gql`
  mutation AddStudentToClass($classId: String!, $studentId: String!) {
    addStudentToClass(classId: $classId, studentId: $studentId) {
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

export const UPDATE_CLASS_MUTATION = gql`
  mutation UpdateClass($updateClassInput: UpdateClassInput!) {
    updateClass(updateClassInput: $updateClassInput) {
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

export const DELETE_CLASS_MUTATION = gql`
  mutation DeleteClass($id: String!) {
    removeClass(id: $id) {
      id
    }
  }
`;

// SCORES - Fixed to match backend schema (score is Float, not Int)
export const CREATE_SCORE_MUTATION = gql`
  mutation CreateScore($createScoreInput: CreateScoreInput!) {
    createScore(createScoreInput: $createScoreInput) {
      id
      studentId
      classId
      subject
      score
    }
  }
`;

export const UPDATE_SCORE_MUTATION = gql`
  mutation UpdateScore($updateScoreInput: UpdateScoreInput!) {
    updateScore(updateScoreInput: $updateScoreInput) {
      id
      studentId
      classId
      subject
      score
    }
  }
`;

export const DELETE_SCORE_MUTATION = gql`
  mutation DeleteScore($id: Int!) {
    removeScore(id: $id) {
      id
    }
  }
`;

// ATTENDANCE - Fixed to match backend schema
export const CREATE_ATTENDANCE_MUTATION = gql`
  mutation CreateAttendance($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
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

// Note: UpdateAttendanceInput in backend only has id field
// This mutation needs backend update to include other fields
export const UPDATE_ATTENDANCE_MUTATION = gql`
  mutation UpdateAttendance($updateAttendanceInput: UpdateAttendanceInput!) {
    updateAttendance(updateAttendanceInput: $updateAttendanceInput) {
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

export const DELETE_ATTENDANCE_MUTATION = gql`
  mutation DeleteAttendance($id: Int!) {
    removeAttendance(id: $id) {
      id
    }
  }
`;

export const REMOVE_STUDENT_FROM_CLASS_MUTATION = gql`
  mutation RemoveStudentFromClass($classId: String!, $studentId: String!) {
    removeStudentFromClass(classId: $classId, studentId: $studentId) {
      id
      className
      subject
      teacherId
      studentIds
    }
  }
`;
