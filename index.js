//modulos externos
const inquirer = require('inquirer');
const chalk = require('chalk');

//modulos internos
const fs = require('fs');

operation();

function operation() {
  inquirer.prompt(
    [
      {
        type: 'list',
        name: 'action',
        message: 'O que voçê deseja fazer ?',
        choices: [
          'Criar Conta',
          'Consultar Saldo',
          'Depositar',
          'Sacar',
          'Sair'
        ]
      }
    ]
  ).then((res) => {

    const action = res['action'];
    
    if(action === 'Criar Conta') {
      createAccount();
    }
    else if(action === 'Depositar') {
      deposit();
    }
    else if(action === 'Consultar Saldo') {
      getAccountBalance();
    }
    else if(action === 'Sacar'){
      withdraw();
    }
    else if(action === 'Sair'){
      console.log(chalk.bgBlue.black('Obrigado por usar o Accounts! '));
      
      setTimeout(() => {
        console.clear();
        process.exit();
      }, 3000);
      
    }

  }).catch((erro) => {
    console.log(erro)
  });
}

//Criar conta
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta a seguir'));
  buildAccount();
}

function buildAccount() {
  inquirer.prompt(
    [
      {
        name: 'accountName',
        message: 'Digite um nome para a sua conta: '
      }
    ]
  ).then((res) => {
    const accountName = res['accountName'];

    console.info(accountName);

    if(!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }

    if(fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'));

      buildAccount();
      return;
    }

    fs.writeFileSync(`accounts/${accountName}.json`, '{ "balance": "0" }', (erro) => {
      console.log(erro)
    })

    console.log(chalk.green('Parabéns a sua conta foi criada! '));
    operation();

  }).catch((erro) => {
    console.log(erro);
  })
}

// add an account to user account
function deposit() {
  inquirer.prompt(
    [
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta ?'
      }
    ]
  ).then((res) => {

    const accountName = res['accountName'];

    //verify if account exists
    if(!checkAccount(accountName)) {
      return deposit();
    }

    inquirer.prompt([
      {
        name: 'amount',
        message: 'Quanto você deseja depositar'
      }
    ]).then((res) => {

      const amount = res['amount'];

      //add amount
      addAmount(accountName, amount);
      operation();

    }).catch((err) => {
      console.log(err);
    })

  }).catch((err) => {
    console.log(err)
  })
}

function checkAccount(accountName) {
  if(!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black(`Esta conta não existe, escolha outro nome!`));
    return false;
  }

  return true;
}

function addAmount(accountName, amount) {
  const account = getAccount(accountName);

  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro tente novamente mais tarde! '));
    return deposit();
  }

  account.balance = parseFloat(amount) + parseFloat(account.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(account),
    (erro) => {
      console.log(erro);
    }
  )

  console.log(`Foi depositado o valor de R$${amount} na sua conta! `);
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r',
  })

  return JSON.parse(accountJSON)
}

//Show account balance
function getAccountBalance() {
  inquirer.prompt(
    [
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta? '
      }
    ]
  ).then((res) => {

    const accountName = res['accountName'];

    //verify if acount exists
    if(!checkAccount(accountName)) {
      return getAccountBalance();
    }

    const accountData = getAccount(accountName);
    console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta e de R$${accountData.balance}`));

    operation();

  }).catch((erro) => {
    console.log(erro);
  });
}

//witdraw an amount from user account
function withdraw() {

  inquirer.prompt(
    [
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta ? '
      }
    ]
  ).then((res) => {

    const accountName = res['accountName'];

    if(!checkAccount(accountName)) {
      return withdraw();
    }

    inquirer.prompt(
      [
        {
          name: 'amount',
          message: 'Quanto você deseja sacar ? '
        }
      ]
    ).then((res) => {

      const amount= res['amount'];
      
      removeAccount(accountName, amount);

    }).catch((erro) => {
      console.log(erro);
    });    

  }).catch((erro) => {
    console.log(erro);
  });
}

function removeAccount(accountName, amount) {

  const accountData = getAccount(accountName);

  if(!amount) {
    console.log(chalk.bgRed.black('Ocorreu um erro tente novamente mais tarde! '));
    return withdraw();
  }

  if(accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível! '));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (erro) => {
      console.log(erro);
    }
  )

  console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta! `));
  operation();
}