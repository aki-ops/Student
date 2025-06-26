import { gql } from '@apollo/client';

export const GET_ATTENDANCES_QUERY = gql`
  query GetAttendances($studentId: ID) {
    attendances(studentId: $studentId) {
      id
      date
      status
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
