# Basic Banking System

## Profile
Name: Tridiktya Hardani Putra

## Installation
### Prerequisites
Before installing, ensure you have the following prerequisites installed on your system:
- **Node.js**: The project requires Node.js to run. You can download it from Node.js official website.
- **npm**: npm (Node Package Manager) is used to manage the dependencies and should come installed with Node.js.

### Installing Dependencies
To set up the project for development on your local machine, please follow the steps below:

1. First, clone this repository to your local machine using Git commands. For example:
```bash
   git clone https://github.com/trdkhardani/24001184-km7-thp-banking-system-ch5.git
    cd 24001184-km7-thp-banking-system-ch5
```
2. Run the following command in the root directory of the project to install all necessary dependencies:
   
   ```npm install```

## Starting the App
### Running the Application
Once the installation is complete, you can start the application using one of the following methods:
1. **npm**
   
   Automatically start using **nodemon** (if you have installed all the required dependencies and configured the value of "start" under the "scripts" to "nodemon index.js" in `package.json` file).
   
   ```npm start```

2. **Directly using Node.js or nodemon**
   
   ```node index.js``` or ```nodemon index.js```

## Configuring .env
1. Set the `DATABASE_URL` value to your own database information.
   
2. Set the `JWT_SECRET_KEY` value to a random secret key by generating it using this command:
   
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Then, copy and paste the generated string to `JWT_SECRET_KEY` as the value. 
   
## Database Migration
Use this command `npx prisma migrate dev` to start the migration from `schema.prisma` file. Then, seed the database using this command: 

```bash 
npm seed
```

If you want to migrate and seed the database simultaneously, use this command instead:
```bash
npm run migrate:seed
```
Note that this command will clear the database. If you familiar with Laravel, it is similar to `php artisan migrate:fresh --seed` command.

## Available Endpoints
See the Swagger documentation in `http://localhost:3000/docs`. You may adjust the base URL according to your own host and port configuration.

For each POST method request bodies, see the validation rules [here](https://github.com/trdkhardani/24001184-km7-thp-banking-system-ch5/tree/main/validation).

## Testing the App
To run the test, use this command:

```bash
npm test -- tests/[directory]/[test_module].spec.js
```

Example:

```bash
npm test -- tests/account/get_all_accounts.spec.js
```