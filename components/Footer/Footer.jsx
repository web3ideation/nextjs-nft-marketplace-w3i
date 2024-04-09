import React from "react"
import Link from "next/link"
import Image from "next/image"

import BtnWithAction from "@components/UI/BtnWithAction"

import styles from "./Footer.module.scss"

const handleClick = () => {
    window.location.href = "https://web3ideation.com/contact"
}

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.footerContainer}>
                    <div className={styles.row}>
                        <div className={styles.footerOne}>
                            <div className={styles.footerLogoWrapper}>
                                <Link
                                    href="https://web3ideation.com/"
                                    className={styles.footerTopLogo}
                                >
                                    <Image
                                        src="/media/Logo-w3i-marketplace.png"
                                        alt="Logo-W3I-Market"
                                        width={200}
                                        height={100}
                                    />
                                </Link>
                            </div>
                            <section className={styles.footerTextWrapper}>
                                <div className={styles.footerText}>
                                    Marketplace by web3ideation
                                    <div className={styles.footerBtnWrapper}>
                                        <BtnWithAction
                                            onClickAction={handleClick}
                                            buttonText={"Kontakt"}
                                        ></BtnWithAction>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className={styles.footerTwo}>
                            <section className={styles.footerContactWrapper}>
                                <h3 className={styles.footerTitle}>Kontakt Info</h3>
                                <ul className={styles.contactList}>
                                    <li>
                                        <i className={styles.mailIcon}></i>
                                        <Link
                                            className={styles.footerLinks}
                                            href="mailto:info@web3ideation.com"
                                        >
                                            info@web3ideation.com
                                        </Link>
                                    </li>
                                </ul>
                            </section>
                        </div>
                        <div className={styles.footerThree}>
                            <section className={styles.footerTextWrapper}>
                                <h3 className={styles.footerTitle}>Rechtliches</h3>{" "}
                                <div className={styles.footerText}>
                                    <p>
                                        <Link
                                            className={styles.footerLinks}
                                            href="https://web3ideation.com/impressum"
                                        >
                                            Impressum
                                        </Link>
                                    </p>
                                    <p>
                                        <Link
                                            className={styles.footerLinks}
                                            href="https://web3ideation.com/datenschutzerklarung"
                                        >
                                            Datenschutzerklärung
                                        </Link>
                                    </p>
                                    <p>
                                        <Link
                                            className={styles.footerLinks}
                                            href="https://web3ideation.com/website-credits"
                                        >
                                            Website Credits
                                        </Link>
                                    </p>
                                    <p>© Copyright 2023 – web3ideation.com</p>
                                </div>
                            </section>{" "}
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 col-sm-12">
                            <div className="copyright text-left">
                                <p>Copyright</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-sm-12">
                            <div className="copyright-widget text-right">
                                <section
                                    id="medvillsocialiconwi_widget-1"
                                    className="widget widget_medvillsocialiconwi_widget"
                                >
                                    <ul className="footer_social">
                                        <li>
                                            <a
                                                href="https://www.linkedin.com/company/web3ideation/ "
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>
                                                    <i className="fa fa-linkedin"></i>
                                                </span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/web3ideation "
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>
                                                    <i className="fab fa-github"></i>
                                                </span>
                                            </a>
                                        </li>
                                    </ul>
                                </section>{" "}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
