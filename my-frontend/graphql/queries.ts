import { gql } from '@apollo/client';

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      role
      name
    }
  }
`;

export const GET_SCORES_QUERY = gql`
  query GetScores($studentId: ID) {
    scores(studentId: $studentId) {
      id
      subject
      score
      student {
        id
        name
      }
      class {
        id
        name
      }
    }
  }
`;

export const GET_CLASSES_QUERY = gql`
  query GetClasses {
    classes {
      id
      name
      teacher {
        id
        name
      }
      students {
        id
        name
      }
    }
  }
`;
