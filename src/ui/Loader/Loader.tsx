import styles from './Loader.module.css';

export const Loader = ({ size = 60, dataTestid }: { size?: number; dataTestid: string }) => {
    return <div data-testid={dataTestid} className={styles.loader} style={{ width: size, height: size }} />;
};
