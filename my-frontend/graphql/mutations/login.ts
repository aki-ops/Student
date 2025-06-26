import { gql } from '@apollo/client';

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: LoginInput!) {
    SignIn(input: $input) {
      access_token
    }
  }
`;
