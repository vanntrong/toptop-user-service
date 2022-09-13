import { User } from '@/models';
import { BaseQuery } from '@/types/common';
import { omit, pick } from 'lodash';
// Delay function
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generating a random integer
export async function randomInt(min: number, max: number): Promise<number> {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const buildQueryFilter = <T>(reqQuery: BaseQuery & T) => {
  const { page, per_page, sort_by, sort_order, q, ...filter } = reqQuery;
  return {
    filter,
    query: { page, per_page, sort_by, sort_order, q },
  };
};

export const toUserResponse = (user: User, limitField?: Array<string>) => {
  return limitField
    ? pick(omit(user, ['password', 'isDeleted']), limitField)
    : omit(user, ['password', 'isDeleted']);
};
