import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyMessage } from "ethers";

export async function verifySignature(req: FastifyRequest, reply: FastifyReply) {
  const enable = process.env.ENABLE_SIGNATURE === "true";
  if (!enable) return;

  try {
    const address = String(req.headers["x-wallet"] || "");
    const signature = String(req.headers["x-signature"] || "");
    const nonce = String(req.headers["x-nonce"] || "NOP-NONCE");

    if (!address || !signature) {
      return reply.code(401).send({ ok: false, error: "Missing signature headers" });
    }
    const recovered = verifyMessage(nonce, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return reply.code(401).send({ ok: false, error: "Invalid signature" });
    }
  } catch (e:any) {
    return reply.code(401).send({ ok: false, error: e.message || "Auth failed" });
  }
}
