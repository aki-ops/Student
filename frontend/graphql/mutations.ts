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
      username
      fullName
      password
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

// CLASSES
export const CREATE_CLASS_MUTATION = gql`
  mutation CreateClass($createClassInput: CreateClassInput!) {
    createClass(createClassInput: $createClassInput) {
      id
      className
      subject
      teacherId
      studentIds
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
      studentIds
    }
  }
`;
export const DELETE_CLASS_MUTATION = gql`
  mutation DeleteClass($id: Int!) {
    removeClass(id: $id) {
      id
    }
  }
`;

// SCORES
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

// ATTENDANCE
export const CREATE_ATTENDANCE_MUTATION = gql`
  mutation CreateAttendance($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
      id
      classId
      date
      records { studentId status }
    }
  }
`;
export const UPDATE_ATTENDANCE_MUTATION = gql`
  mutation UpdateAttendance($updateAttendanceInput: UpdateAttendanceInput!) {
    updateAttendance(updateAttendanceInput: $updateAttendanceInput) {
      id
      classId
      date
      records { studentId status }
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
