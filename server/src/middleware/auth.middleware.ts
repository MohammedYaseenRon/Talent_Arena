// import { Request, Response, NextFunction } from "express";


// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 userId: string,
//                 role: Role
//             }
//         }
//     }
// }


// export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//     try{
//         const token = req.headers.authorization?.split(" ")[1];
//         if(!token) {
//             return res.status(401).json({message: "Token is required to validate"});
//         }
//         const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
//             userId: string,
//             role: Role
//         }
//         req.user = decoded;
//         next();
//     }catch(error) {
//         return res.status(500).json({error: "Internal server error"});
//     }
// }