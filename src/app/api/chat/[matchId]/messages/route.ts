import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: {
    matchId: string;
  };
};

export async function POST(req: NextRequest, context: Context) {
  try {
    const { matchId } = context.params;

    // Parse request body safely
    const body = await req.json();

    // TODO: Replace with your logic to handle message creation
    // Example: Save message to DB
    // await db.message.create({ data: { matchId, ...body } });

    return NextResponse.json(
      {
        success: true,
        message: "Message processed successfully",
        matchId,
        body,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling POST /messages:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message",
      },
      { status: 500 }
    );
  }
}
