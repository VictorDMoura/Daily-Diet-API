import knex from "knex";

declare module "knex/types/tables" {
  export interface Table {
    users: {
      id: string;
      name: string;
      email: string;
      created_at: Date;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      date: string;
      hour: string;
      user_id: string;
      created_at: Date;
    };
  }
}
