import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Collection from "@/lib/models/Collection";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    await connectToDB();

    const { title, description, image } = await req.json();
    if (!title || !image) {
      return new NextResponse(
        JSON.stringify({ error: "Title and image are required" }),
        { status: 400 }
      );
    }

    const existingCollection = await Collection.findOne({ title });
    if (existingCollection) {
      return new NextResponse(
        JSON.stringify({ error: "Collection already exists" }),
        { status: 400 }
      );
    }

    const newCollection = new Collection({
      title,
      description,
      image,
    });
    await newCollection.save();

    return NextResponse.json(newCollection, { status: 201 });
  } catch (err) {
    console.error("[collections_POST]", err);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    await connectToDB();

    const collections = await Collection.find().sort({ createdAt: -1 });
    return NextResponse.json(collections, { status: 200 });
  } catch (err) {
    console.error("[collections_GET]", err);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};

export const dynamic = "force-dynamic";
