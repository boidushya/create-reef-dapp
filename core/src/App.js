import React, { useState } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { WsProvider } from "@polkadot/rpc-provider";
import { Contract } from "ethers";
import GreeterContract from "./contracts/Greeter.json";
import Uik from "@reef-defi/ui-kit";

const FactoryAbi = GreeterContract.abi;
const factoryContractAddress = GreeterContract.address;

const URL = "wss://rpc-testnet.reefscan.com/ws";

function App() {
	const [msgVal, setMsgVal] = useState("");
	const [msg, setMsg] = useState("");
	const [signer, setSigner] = useState();
	const [isWalletConnected, setWalletConnected] = useState(false);

	const checkExtension = async () => {
		let allInjected = await web3Enable("Reef");

		if (allInjected.length === 0) {
			return false;
		}

		let injected;
		if (allInjected[0] && allInjected[0].signer) {
			injected = allInjected[0].signer;
		}

		const evmProvider = new Provider({
			provider: new WsProvider(URL),
		});

		evmProvider.api.on("ready", async () => {
			const allAccounts = await web3Accounts();

			allAccounts[0] &&
				allAccounts[0].address &&
				setWalletConnected(true);

			console.log(allAccounts);

			const wallet = new Signer(
				evmProvider,
				allAccounts[0].address,
				injected
			);

			// Claim default account
			if (!(await wallet.isClaimed())) {
				console.log(
					"No claimed EVM account found -> claimed default EVM account: ",
					await wallet.getAddress()
				);
				await wallet.claimDefaultAccount();
			}

			setSigner(wallet);
		});
	};

	const checkSigner = async () => {
		if (!signer) {
			await checkExtension();
		}
		return true;
	};

	const getGreeting = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		const result = await factoryContract.greet();
		setMsg(result);
	};

	const setGreeting = async () => {
		await checkSigner();
		const factoryContract = new Contract(
			factoryContractAddress,
			FactoryAbi,
			signer
		);
		await factoryContract.setGreeting(msgVal);
		setMsgVal("");
		getGreeting();
	};

	return (
		<Uik.Container className="main">
			<Uik.Container vertical>
				<Uik.Container>
					<Uik.Text text="Create" type="headline" />
					<Uik.ReefLogo /> <Uik.Text text="Dapp" type="headline" />
				</Uik.Container>
				{isWalletConnected ? (
					<Uik.Container vertical className="container">
						<Uik.Divider text="Get Message from Contract" />
						<Uik.Card condensed>
							<Uik.Container>
								<Uik.Input
									onChange={e => setMsgVal(e.target.value)}
									value={msgVal}
								/>
								<Uik.Button
									onKeyPress={e => {
										e.key === "Enter" && setGreeting();
									}}
									onClick={setGreeting}
									text="Set message"
									className="container-button"
								/>
							</Uik.Container>
						</Uik.Card>
						<Uik.Divider text="Set Message to Contract" />
						<Uik.Card condensed>
							<Uik.Container flow="spaceBetween">
								<Uik.Text
									text={
										msg.length
											? msg
											: "Nothing on contract yet"
									}
									type={msg.length ? "lead" : "light"}
								/>
								<Uik.Button
									className="container-button"
									onClick={getGreeting}
									text="Get Message"
								/>
							</Uik.Container>
						</Uik.Card>
					</Uik.Container>
				) : (
					<>
						<Uik.Container vertical className="container">
							<Uik.Text
								className="title"
								text="Congratulations! Your Reef Dapp is set to go 🎉"
								type="title"
							/>
							<Uik.Text
								text="We've gone ahead and added essential Reef components to quickstart your Dapp 🪸"
								type="light"
							/>
							<br />
							<Uik.Text
								type="light"
								text={
									<>
										<a
											target="_blank"
											rel="noreferrer"
											href="https://ui-kit.reef.io"
										>
											Reef UI Kit:
										</a>
										<span>
											{" "}
											Reef's official component library to
											help you make beautiful dapps with
											ease
										</span>
									</>
								}
							/>
							<Uik.Text
								type="light"
								text={
									<>
										<a
											target="_blank"
											rel="noreferrer"
											href="https://github.com/reef-defi/evm-provider.js"
										>
											Reef EVM Provider:
										</a>
										<span>
											{" "}
											Implements a web3 provider which can
											interact with the Reef chain EVM.
										</span>
									</>
								}
							/>
							<Uik.Text
								type="light"
								text={
									<>
										<a
											target="_blank"
											rel="noreferrer"
											href="https://create-react-app.dev/"
										>
											Create React App:
										</a>
										<span>
											{" "}
											Create React App is the best way to
											start building a new single-page
											application in React.
										</span>
									</>
								}
							/>
							<Uik.Text
								type="light"
								text={
									<>
										<a
											target="_blank"
											rel="noreferrer"
											href="https://github.com/dilanx/craco"
										>
											Craco:
										</a>
										<span>
											{" "}
											Craco helps you leverage the power
											of webpack and babel configurations
											without ejecting your CRA template
										</span>
									</>
								}
							/>
							<br />
							<Uik.Text
								text={
									<>
										Click the{" "}
										<Uik.Tag>Connect Wallet</Uik.Tag> button
										to get started 🚀
									</>
								}
								type="light"
							/>
						</Uik.Container>
						<br />
						<Uik.Button
							text="Connect Wallet"
							onClick={checkExtension}
						/>
					</>
				)}
			</Uik.Container>
		</Uik.Container>
	);
}

export default App;
