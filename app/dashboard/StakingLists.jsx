'use client'

import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react"
import moment from "moment";
import { useEffect, useState } from "react"
import {
  getHistory,
  convertToBN,
  convertFromHextToInt,
  getDecimal,
  convertToLocalTime,
  withdraw_token,
  redeposite_token
} from "@/anchor/setup";
import { MINT_ADDRESS } from "@/constant";
import { useWeb3 } from "@/hook/useweb3";


const HistoryItemComponent = ({ staking, className }) => {
  return (
    <tr className={`${className} h-[56px]`}>
      <th className="px-4 md:px-6">
        <div className="flex items-center justify-center text-base font-normal text-white text-nowrap">
          {staking.amount}
        </div>
      </th>
      <th className="px-4 md:px-6">
        <div className="flex items-center justify-center text-base font-normal text-white text-nowrap">
          {staking.startTime}
        </div>
      </th>
      <th className="px-4 md:px-6">
        <div className="flex items-center justify-center text-base font-normal text-white text-nowrap">
          {staking.endTime}
        </div>
      </th>
      <th className="px-4 md:px-6">
        <div className="flex items-center justify-center text-base font-normal text-white text-nowrap">
          {staking.apy}%
        </div>
      </th>
      <th className="px-4 md:px-6">
        <div className="flex items-center justify-center text-base font-normal text-white text-nowrap">
          {staking.status}
        </div>
      </th>
      <th className="px-4 md:px-6">
        <div className="flex items-center justify-center gap-2 text-sm font-normal text-white">
          <button
            disabled={staking.status === 'Locked'}
            className="w-[100px] h-[32px] hover:bg-textFooterTitle rounded-[4px] hover:text-black bg-black border border-textHeader text-textFootTitle transition-colors duration-150 ease-linear disabled:opacity-50 disabled:cursor-not-allowed">
            Withdraw
          </button>
          <button
            disabled={staking.status === 'Locked'}
            className="w-[100px] h-[32px] hover:bg-textFooterTitle rounded-[4px] hover:text-black bg-black border border-textHeader text-textFootTitle transition-colors duration-150 ease-linear disabled:opacity-50 disabled:cursor-not-allowed">
            Claim
          </button>
        </div>
      </th>
    </tr>
  )
}

const StakingLists = () => {
  const [stakingData, setStakingData] = useState([])
  const { setGlobalHistory } = useWeb3();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const _getHistory = async () => {
      try {
        setIsLoading(true)
        const userHistoryData = await getHistory(MINT_ADDRESS, publicKey)
        console.log("aaa")
        const amount = await convertToBN(userHistoryData.stakingAmount)
        const startTime = await convertFromHextToInt(userHistoryData.stakingStart)
        const period = await convertFromHextToInt(userHistoryData.stakingPeriod)
        const apy = await convertFromHextToInt(userHistoryData.stakingApy)
        const stakingData = amount.map((amt, index) => ({
          amount: amt,
          startTime: moment(new Date(convertToLocalTime(startTime[index]))).format('YYYY/MM/DD'),
          endTime: moment(new Date(convertToLocalTime(startTime[index]))).add(period[index], "days").format('YYYY/MM/DD'),
          apy: apy[index],
          status: moment().isAfter(moment(new Date(convertToLocalTime(startTime[index]))).add(period[index], 'days')) ? 'Unlocked' : 'Locked'
        }))
        setStakingData(stakingData)
        setGlobalHistory(stakingData)
        setIsLoading(false)
      } catch (err) {
        console.error("eee", err);
      }
    }
    if (publicKey)
      _getHistory()
  }, [publicKey])


  return (
    <div className="flex flex-col gap-5">
      <p className="leading-[56px] text-4xl font-medium text-white">Staking Lists</p>
      <div className="border-[0.5px] border-textHeader rounded-xl bg-transparent overflow-x-auto">
        <table className="w-full text-base text-white">
          <thead>
            <tr className="h-[84px] border-b-[0.5px] border-textHeader !px-8 md:!px-12">
              <th className="px-4 md:px-6">
                <div className="flex items-center justify-center text-nowrap">
                  Amount
                </div>
              </th>
              <th className="px-4 md:px-6">
                <div className="flex items-center justify-center text-nowrap">
                  Start Date
                </div>
              </th>
              <th className="px-4 md:px-6">
                <div className="flex items-center justify-center text-nowrap">
                  End Date
                </div>
              </th>
              <th className="px-4 md:px-6">
                <div className="flex items-center justify-center text-nowrap">
                  APY
                </div>
              </th>
              <th className="px-4 md:px-6 min-w-[180px]">
                <div className="flex items-center justify-center text-nowrap">
                  Staking Status
                </div>
              </th>
              <th className="px-4 md:px-6 min-w-[240px]">
                <div className="flex items-center justify-center">
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {stakingData.length == 0 ?
              <tr>
                <td colSpan={6} className="py-5 text-center">
                  <p>No active staking positions</p>
                </td>
              </tr>
              : isLoading
                ? <tr>
                  <td colSpan={6} className="py-5 text-center">
                    <p>Loading...</p>
                  </td>
                </tr>
                :
                stakingData.map((staking, idx) => (
                  <HistoryItemComponent
                    key={idx}
                    staking={staking}
                    className={idx % 2 === 0 ? "bg-bgHeader" : "bg-transparent"}
                  />
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StakingLists