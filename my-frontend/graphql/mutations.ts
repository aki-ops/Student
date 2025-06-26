import { gql } from '@apollo/client';

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($username: String!, $password: String!) {
    SignIn(input: { username: $username, password: $password }) {
      access_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation CreateUser($fullName: String!, $username: String!, $password: String!, $role: UserRole!) {
    CreateUser(input: { fullName: $fullName, username: $username, password: $password, role: $role }) {
      id
      username
      fullName
      role
    }
  }
`;
