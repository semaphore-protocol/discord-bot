import { parseBytes32String } from "@ethersproject/strings"

export function stringifySignal(signal) {
    return parseBytes32String("0x" + BigInt(signal).toString(16))
}
