// React Import
import React from "react"

// SVG Icons Imports - Importing specific category icons from a deeply nested path
import NewIcon from "@public/media/categories/new.svg"
import MusicIcon from "@public/media/categories/music.svg"
import DaoIcon from "@public/media/categories/dao.svg"
import MembershipIcon from "@public/media/categories/membership.svg"
import GamesIcon from "@public/media/categories/games.svg"
import ArtIcon from "@public/media/categories/art.svg"
import SportIcon from "@public/media/categories/sport.svg"
import FinanceIcon from "@public/media/categories/finance.svg"
import TechnologyIcon from "@public/media/categories/technology.svg"
import FashionIcon from "@public/media/categories/fashion.svg"
import LiteratureIcon from "@public/media/categories/literature.svg"
import TravelIcon from "@public/media/categories/travel.svg"
import FoodBeverageIcon from "@public/media/categories/foodBeverage.svg"
import SocialMediaIcon from "@public/media/categories/socialMedia.svg"
import RealWorldAssetsIcon from "@public/media/categories/realWorldAssets.svg"
import VREstateIcon from "@public/media/categories/VREstate.svg"
import CollectiblesIcon from "@public/media/categories/collectible.svg"
import EntertainmentIcon from "@public/media/categories/entertainment.svg"
import EducationIcon from "@public/media/categories/education.svg"
import HealthWellnessIcon from "@public/media/categories/health.svg"
import EnvironmentIcon from "@public/media/categories/environment.svg"
import WearablesIcon from "@public/media/categories/wearables.svg"
import TopTenIcon from "@public/media/categories/topTen.svg"
import TopValueIcon from "@public/media/categories/topValue.svg"
import MostSoldIcon from "@public/media/categories/mostSold.svg"
import DigitalTwinIcon from "@public/media/categories/digitalTwin.svg"
import UtilityIcon from "@public/media/categories/utility.svg"

// Style Import
import styles from "./CategoryIcon.module.scss"

// Mapping category names to their respective icons
const categoryIcons = {
    "Brand New": NewIcon,
    Music: MusicIcon,
    DAO: DaoIcon,
    Membership: MembershipIcon,
    Gaming: GamesIcon,
    Art: ArtIcon,
    Sports: SportIcon,
    Finance: FinanceIcon,
    Technology: TechnologyIcon,
    Fashion: FashionIcon,
    Literature: LiteratureIcon,
    Travel: TravelIcon,
    "F&B": FoodBeverageIcon,
    "Social Media": SocialMediaIcon,
    RWAs: RealWorldAssetsIcon,
    "VR Estate": VREstateIcon,
    Collectibles: CollectiblesIcon,
    Entertainment: EntertainmentIcon,
    Education: EducationIcon,
    "Health & Wellness": HealthWellnessIcon,
    Environment: EnvironmentIcon,
    Wearables: WearablesIcon,
    10: TopTenIcon,
    "Top Value": TopValueIcon,
    "Most Sold": MostSoldIcon,
    "Digital Twin": DigitalTwinIcon,
    Utility: UtilityIcon,
}

// CategoryIcon Component - Displays the icon corresponding to the provided category name
const CategoryIcon = ({ categoryName }) => {
    // Lookup the icon based on the category name; default to null if not found
    const Icon = categoryIcons[categoryName] || null

    // Conditional rendering of the Icon component if it exists

    return Icon ? (
        <div className={styles.categoryIconWrapper}>
            <Icon className={styles.categoryIcon} />
        </div>
    ) : null
}

export default CategoryIcon
