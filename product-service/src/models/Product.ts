export default interface Product {
    /**
     * @pattern ^[0-9a-z]{8}(-[0-9a-z]{4}){3}-[0-9a-z]{12}$
     */
    id?: string;
    /**
     * @pattern ^[0-9]{13}$
     */
    isbn: string;
    title: string;   
    author?: string;
    publisher: string;
    description?: string;
    /**
     * @type integer
     * @minimum 1
     * @maximum 2200
     */
    year: number;
    /**
     * @minimum 0
     */    
    price: number;
    /**
     * @minimum 0
     */
    count: number;
}
