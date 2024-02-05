import styles from "./Footer.module.scss"

export default function Footer({}) {
    return (
        <footer id="rs-footer" className={styles.Footer}>
            <div className={styles.FooterTop}>
                <div className={styles.footerContainer}>
                    <div className="row">
                        <div className="col-lg-4 footer-0">
                            <div className="footer-logo-wrap">
                                <a href="https://web3ideation.com/" className="footer-top-logo">
                                    <img
                                        src="https://web3ideation.com/wp-content/uploads/2023/07/Logo-insconsolata-straightened-negative-e1690296974366.png"
                                        alt="web3ideation"
                                    />
                                </a>
                            </div>
                            <section
                                id="custom_html-1"
                                className="widget_text widget widget_custom_html"
                            >
                                <div className="textwidget custom-html-widget">
                                    Marketplace @ web3ideation
                                    <p className="footer-btn-wrap">
                                        <a
                                            href="https://web3ideation.com/contact"
                                            className="footer-btn"
                                        >
                                            Kontakt
                                        </a>
                                    </p>
                                    <br />
                                </div>
                            </section>{" "}
                        </div>
                        <div className="col-lg-4 footer-1">
                            <section
                                id="contact_widget-2"
                                className="widget widget_contact_widget"
                            >
                                <h3 className="footer-title">Kontakt Info</h3>
                                <ul className="fa-ul">
                                    <li>
                                        <i className="flaticon-call"></i>
                                        <a href="tel:+491747440371"> +49 174 7440371</a>
                                    </li>
                                    <li>
                                        <i className="flaticon-email"></i>
                                        <a href="mailto:info@web3ideation.com">
                                            info@web3ideation.com
                                        </a>
                                    </li>
                                </ul>
                            </section>{" "}
                        </div>
                        <div className="col-lg-4 footer-3">
                            <section id="text-3" className="widget widget_text">
                                <h3 className="footer-title">Rechtliches</h3>{" "}
                                <div className="textwidget">
                                    <p>
                                        <a href="https://web3ideation.com/impressum">Impressum</a>
                                    </p>
                                    <p>
                                        <a href="https://web3ideation.com/datenschutzerklarung">
                                            Datenschutzerklärung
                                        </a>
                                    </p>
                                    <p>
                                        <a href="https://web3ideation.com/website-credits">
                                            Website Credits
                                        </a>
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
