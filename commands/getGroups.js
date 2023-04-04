import { SlashCommandBuilder } from "discord.js"
import { SemaphoreSubgraph } from "@semaphore-protocol/data"

export const data = new SlashCommandBuilder()
    .setName("get-groups")
    .setDescription("Get a list of Semaphore groups")
    .addStringOption((option) =>
        option.setName("network").setDescription("The Semaphore network to fetch groups from").setRequired(true)
    )

export async function execute(interaction) {
    const network = interaction.options.getString("network") ?? "goerli"

    await interaction.reply(`Loading ${network} groups`)

    const semaphore = new SemaphoreSubgraph(network)

    const groupIds = await semaphore.getGroupIds()

    await interaction.followUp(groupIds.map((id) => ` - ${id}`).join("\n"))
}
