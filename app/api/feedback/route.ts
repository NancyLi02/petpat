import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || "ln.xiaolan02@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, summary, message } = body;
    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !summary ||
      typeof summary !== "string" ||
      !message ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Name, email, summary, and message are required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const nameStr = name.trim();
    const emailStr = email.trim();
    const summaryStr = summary.trim();
    const messageStr = message.trim();

    const text = [
      `Name: ${nameStr}`,
      `Email: ${emailStr}`,
      `Summary: ${summaryStr}`,
      "",
      "Message:",
      messageStr,
    ].join("\n");

    const subjectSummary =
      summaryStr.length > 50 ? `${summaryStr.slice(0, 50)}…` : summaryStr;

    const { data, error } = await resend.emails.send({
      from: "PetPat Feedback <onboarding@resend.dev>",
      to: [FEEDBACK_EMAIL],
      replyTo: emailStr,
      subject: `[PetPat] ${subjectSummary}`,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
