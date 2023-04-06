import { SemaphoreEthers, SemaphoreSubgraph } from "@semaphore-protocol/data"
import { SlashCommandBuilder } from "discord.js"
import { stringifySignal } from "../utils.js"

export const data = new SlashCommandBuilder()
    .setName("get-group")
    .setDescription("Get the data of a group from a supported network.")
    .addStringOption((option) =>
        option.setName("group-id").setDescription("Identifier of the group.").setRequired(true)
    )
    .addStringOption((option) =>
        option.setName("network").setDescription("Supported Ethereum network.").setRequired(true).addChoices(
            {
                name: "Arbitrum",
                value: "arbitrum"
            },
            {
                name: "Goerli",
                value: "goerli"
            },
            {
                name: "Sepolia",
                value: "sepolia"
            },
            {
                name: "Mumbai",
                value: "mumbai"
            },
            {
                name: "Arbitrum Goerli",
                value: "arbitrum-goerli"
            },
            {
                name: "Optimism Goerli",
                value: "optimism-goerli"
            }
        )
    )
    .addBooleanOption((option) =>
        option.setName("ephemeral").setDescription("Whether or not the response should be private.")
    )

export async function execute(interaction) {
    const groupId = interaction.options.getString("group-id")
    const network = interaction.options.getString("network")
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? true

    await interaction.deferReply({ ephemeral })

    let group

    if (network === "sepolia") {
        const semaphore = new SemaphoreEthers(network, {
            apiKey: process.env.INFURA_API_KEY
        })

        group = await semaphore.getGroup(groupId)

        if (!group) {
            await interaction.editReply({ content: `Group **${groupId}** does not exist!`, ephemeral })
            return
        }

        group.members = await semaphore.getGroupMembers(groupId)
        group.verifiedProofs = await semaphore.getGroupVerifiedProofs(groupId)
    } else {
        const semaphore = new SemaphoreSubgraph(network)

        group = await semaphore.getGroup(groupId, { members: true, verifiedProofs: true })

        if (!group) {
            await interaction.editReply({ content: `Group **${groupId}** does not exist!`, ephemeral })
            return
        }
    }

    let content = `**Group ${group.id}** (${network})`
    content += `\n    • Merkle tree root: ${group.merkleTree.root}`
    content += `\n    • Merkle tree depth: ${group.merkleTree.depth}`
    content += `\n    • Number of members: ${group.members.length}`

    const signals = group.verifiedProofs.map(({ signal }) => signal)

    if (signals.length === 0) {
        content += `\n    • Number of signals: 0`
    } else {
        try {
            content += `\n    • Signals: \n${signals.map((signal) => `      - ${stringifySignal(signal)}`).join("\n")}`
        } catch (error) {
            content += `\n    • Signals: ${group.verifiedProofs.length}`
        }
    }

    await interaction.editReply({ content, ephemeral })
}
