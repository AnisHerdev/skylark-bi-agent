import {
  MondayBoardResponse,
  MondayItem,
  MondayPaginationResponse,
} from "./types";

const MONDAY_API_URL = "https://api.monday.com/v2";

export async function fetchMondayBoard(boardId: string): Promise<MondayItem[]> {
  const apiKey = process.env.MONDAY_API_KEY;
  if (!apiKey) {
    throw new Error("MONDAY_API_KEY is not set in your environment variables.");
  }

  const query = `query getBoardItems($boardIds: [ID!]) {
    boards(ids: $boardIds) {
      id
      name
      items_page(limit: 500) {
        items {
          id
          name
          created_at
          updated_at
          column_values {
            id
            text
            value
            column {
              id
              title
              type
            }
          }
        }
        cursor
      }
    }
  }`;

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({
      query,
      variables: {
        boardIds: [boardId],
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Monday API HTTP error ${res.status}: ${text}`);
  }

  const json: MondayBoardResponse = await res.json();

  if (json.errors && json.errors.length > 0) {
    const errorMsg = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Monday GraphQL error: ${errorMsg}`);
  }

  if (json.error_message) {
    throw new Error(`Monday API error: ${json.error_message}`);
  }

  const board = json.data?.boards?.[0];
  if (!board) {
    throw new Error(
      `Monday board with ID '${boardId}' was not found or your access token doesn't have permission to view it.`
    );
  }

  let allItems = board.items_page?.items ?? [];
  let cursor = board.items_page?.cursor ?? null;

  while (cursor) {
    const nextPage = await fetchNextPage(cursor);
    allItems = [...allItems, ...nextPage.items];
    cursor = nextPage.cursor;
  }

  return allItems;
}

async function fetchNextPage(
  cursor: string
): Promise<{ items: MondayItem[]; cursor: string | null }> {
  const apiKey = process.env.MONDAY_API_KEY!;

  const query = `query getNextPage($cursor: String!) {
    next_items_page(cursor: $cursor, limit: 500) {
      items {
        id
        name
        created_at
        updated_at
        column_values {
          id
          text
          value
          column {
            id
            title
            type
          }
        }
      }
      cursor
    }
  }`;

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "API-Version": "2024-10",
    },
    body: JSON.stringify({
      query,
      variables: {
        cursor,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Monday API pagination HTTP error ${res.status}: ${text}`);
  }

  const json: MondayPaginationResponse = await res.json();

  if (json.errors && json.errors.length > 0) {
    const errorMsg = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Monday GraphQL pagination error: ${errorMsg}`);
  }

  return (
    json.data?.next_items_page ?? {
      items: [],
      cursor: null,
    }
  );
}
