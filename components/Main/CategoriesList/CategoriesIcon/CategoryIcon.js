import React from "react"

import NewIcon from "@public/media/categories/new.svg"
import TopTenIcon from "@public/media/categories/topTen.svg"
import TopValueIcon from "@public/media/categories/topValue.svg"
import MostSoldIcon from "@public/media/categories/mostSold.svg"
import DaoIcon from "@public/media/categories/dao.svg"
import MusicIcon from "@public/media/categories/music.svg"
import MembershipIcon from "@public/media/categories/membership.svg"
import RealWorldAssetsIcon from "@public/media/categories/realWorldAssets.svg"
import GamesIcon from "@public/media/categories/games.svg"
import WearablesIcon from "@public/media/categories/wearables.svg"
import DigitalTwinIcon from "@public/media/categories/digitalTwin.svg"
import UtilityIcon from "@public/media/categories/utility.svg"

import styles from "./CategoryIcon.module.scss"

const categoryIcons = {
    "Brand New": NewIcon,
    10: TopTenIcon,
    "Top Value": TopValueIcon,
    "Most Sold": MostSoldIcon,
    DAO: DaoIcon,
    Music: MusicIcon,
    Membership: MembershipIcon,
    RWAs: RealWorldAssetsIcon,
    Gaming: GamesIcon,
    Wearables: WearablesIcon,
    "Digital Twin": DigitalTwinIcon,
    Utility: UtilityIcon,
}

const CategoryIcon = ({ categoryName }) => {
    const Icon = categoryIcons[categoryName] || null
    return Icon ? (
        <div className={styles.categoryIconWrapper}>
            <Icon className={styles.categoryIcon} />
        </div>
    ) : null
}

export default CategoryIcon
