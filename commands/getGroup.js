import { SlashCommandBuilder } from "discord.js"
import { SemaphoreSubgraph } from "@semaphore-protocol/data"

export const data = new SlashCommandBuilder()
    .setName("get-group")
    .setDescription("Get a group data")
    .addStringOption((option) => option.setName("group-id").setDescription("The Semaphore group id").setRequired(true))
    .addStringOption((option) =>
        option.setName("network").setDescription("The Semaphore network to fetch groups from").setRequired(true)
    )

export async function execute(interaction) {
    const network = interaction.options.getString("network") ?? "goerli"
    const groupId = interaction.options.getString("group-id")

    await interaction.reply(`Loading ${network} groups`)

    const semaphore = new SemaphoreSubgraph(network)

    const group = await semaphore.getGroup(groupId)

    await interaction.followUp(JSON.stringify(group))
}
