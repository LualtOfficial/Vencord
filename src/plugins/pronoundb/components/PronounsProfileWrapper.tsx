/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { useAwaiter } from "../../../utils/misc";
import { Settings } from "../../../Vencord";
import { UserStore } from "../../../webpack/common";
import { fetchPronouns, formatPronouns } from "../pronoundbUtils";
import { PronounMapping, UserProfileProps } from "../types";

export default function PronounsProfileWrapper(props: UserProfileProps, pronounsComponent: JSX.Element) {
    // Don't bother fetching bot or system users
    if (props.user.bot || props.user.system) return null;
    // Respect showSelf options
    if (!Settings.plugins.PronounDB.showSelf && props.user.id === UserStore.getCurrentUser().id) return null;

    const [result, , isPending] = useAwaiter(
        () => fetchPronouns(props.user.id),
        null,
        e => console.error("Fetching pronouns failed: ", e)
    );

    // If the promise completed, the result was not "unspecified", and there is a mapping for the code, then return a span with the pronouns
    if (!isPending && result && result !== "unspecified" && PronounMapping[result]) {
        // First child is the header, second is a div with the actual text
        const [, pronounsBodyComponent] = pronounsComponent.props.children as [JSX.Element, JSX.Element];
        pronounsBodyComponent.props.children = formatPronouns(result);
        return pronounsComponent;
    }
    // Otherwise, return null so nothing else is rendered
    else return null;
}